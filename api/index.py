import asyncio
import time
import re
from fastapi import FastAPI, HTTPException, Query, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from cachetools import TTLCache

app = FastAPI(title="Sherlock Web API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Cache for 5 minutes
cache = TTLCache(maxsize=1000, ttl=300)

# Rate limiter: 20 requests per IP per minute
RATE_LIMIT = 20
rate_limit_cache = TTLCache(maxsize=10000, ttl=60)

USERNAME_REGEX = re.compile(r"^[a-zA-Z0-9._-]{2,30}$")

@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.url.path == "/api/search":
        client_ip = request.client.host if request.client else "unknown"
        # Use forwarded IP if behind proxy (like Vercel)
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            client_ip = forwarded.split(",")[0].strip()
            
        current_count = rate_limit_cache.get(client_ip, 0)
        if current_count >= RATE_LIMIT:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded (20 requests/minute)"}
            )
        rate_limit_cache[client_ip] = current_count + 1
        
    response = await call_next(request)
    return response

@app.get("/api/search")
async def search_username(username: str = Query(..., description="Username to search")):
    if not USERNAME_REGEX.match(username):
        raise HTTPException(status_code=400, detail="Username tidak valid")
    
    if username in cache:
        return JSONResponse(content=cache[username])
        
    start_time = time.time()
        
    try:
        # Run Sherlock Project via subprocess
        process = await asyncio.create_subprocess_exec(
            "python", "-m", "sherlock", username,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )

        
        try:
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=60.0)
        except asyncio.TimeoutError:
            process.kill()
            raise HTTPException(status_code=504, detail="Timeout")
            
        output = stdout.decode("utf-8")
        
        results = []
        found_count = 0
        not_found_count = 0
        unknown_count = 0
        
        for line in output.split("\n"):
            line = line.strip()
            if not line:
                continue
            if line.startswith("[+]"):
                parts = line[3:].strip().split(":", 1)
                if len(parts) == 2:
                    site = parts[0].strip()
                    url = parts[1].strip()
                    results.append({"site": site, "url": url, "status": "found"})
                    found_count += 1
            elif line.startswith("[-]"):
                parts = line[3:].strip().split(":", 1)
                if len(parts) >= 1:
                    site = parts[0].strip()
                    results.append({"site": site, "url": "", "status": "not_found"})
                    not_found_count += 1
            elif "Error" in line or "Unknown" in line:
                unknown_count += 1
                
        total = found_count + not_found_count + unknown_count
        elapsed = time.time() - start_time
        
        response_data = {
            "username": username,
            "total": total,
            "found": found_count,
            "not_found": not_found_count,
            "unknown": unknown_count,
            "time": f"{elapsed:.1f}s",
            "results": results
        }
        
        if total == 0 and process.returncode != 0:
            raise HTTPException(status_code=500, detail="Sherlock gagal dijalankan")
            
        cache[username] = response_data
        return JSONResponse(content=response_data)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Sherlock gagal dijalankan")

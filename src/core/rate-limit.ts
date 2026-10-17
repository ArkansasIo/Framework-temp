export interface RateLimitResult { readonly allowed:boolean; readonly remaining:number; readonly resetAt:number; }
export class TokenBucket {
  private tokens:number; private last:number;
  public constructor(private readonly capacity:number, private readonly refillPerSecond:number){ if(capacity<=0||refillPerSecond<=0) throw new Error("Invalid rate limit configuration"); this.tokens=capacity; this.last=Date.now(); }
  consume(cost=1):RateLimitResult { const now=Date.now(); const elapsed=(now-this.last)/1000; this.tokens=Math.min(this.capacity,this.tokens+elapsed*this.refillPerSecond); this.last=now; const allowed=this.tokens>=cost; if(allowed)this.tokens-=cost; const missing=Math.max(0,cost-this.tokens); const resetAt=now+missing/this.refillPerSecond*1000; return {allowed,remaining:Math.floor(this.tokens),resetAt}; }
}

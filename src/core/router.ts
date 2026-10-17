export interface Route { method: string; path: string; handler: (request: HttpRequest) => Promise<HttpResponse> | HttpResponse; }
export interface HttpRequest { method: string; path: string; headers: Readonly<Record<string,string>>; body?: unknown; }
export interface HttpResponse { status: number; headers?: Readonly<Record<string,string>>; body?: unknown; }
export class Router {
  private routes: Route[] = [];
  add(route: Route): this { this.routes.push({...route, method:route.method.toUpperCase()}); return this; }
  remove(method:string,path:string): number { const before=this.routes.length; this.routes=this.routes.filter(r=>!(r.method===method.toUpperCase()&&r.path===path)); return before-this.routes.length; }
  match(method:string,path:string): Route|undefined { return this.routes.find(r=>r.method===method.toUpperCase()&&r.path===path) ?? this.routes.find(r=>r.method===method.toUpperCase()&&r.path.endsWith("/*")&&path.startsWith(r.path.slice(0,-1))); }
  async handle(request:HttpRequest):Promise<HttpResponse>{ const route=this.match(request.method,request.path); return route ? await route.handler(request) : {status:404,body:{error:"Not Found"}}; }
  list(): Route[]{return [...this.routes];}
}

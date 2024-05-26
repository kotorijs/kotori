import { NextFunction, Request, Response } from 'express';
import { IncomingMessage } from 'node:http';
import Ws from 'ws';

type RemoveTail<S extends string, Tail extends string> = S extends `${infer P}${Tail}` ? P : S;
type GetRouteParameter<S extends string> = RemoveTail<
  RemoveTail<RemoveTail<S, `/${string}`>, `-${string}`>,
  `.${string}`
>;

interface ParamsDictionary {
  [key: string]: string;
}

type RouteParameters<Route extends string> = string extends Route
  ? ParamsDictionary
  : Route extends `${string}(${string}`
    ? ParamsDictionary
    : Route extends `${string}:${infer Rest}`
      ? (GetRouteParameter<Rest> extends never
          ? ParamsDictionary
          : GetRouteParameter<Rest> extends `${infer ParamName}?`
            ? { [P in ParamName]?: string }
            : { [P in GetRouteParameter<Rest>]: string }) &
          (Rest extends `${GetRouteParameter<Rest>}${infer Next}` ? RouteParameters<Next> : unknown)
      : object;

export type HttpRouteHandler<P extends string = string> = (
  req: Request<RouteParameters<P>>,
  res: Response,
  next: NextFunction
) => unknown;

type KeyList = 'get' | 'post' | 'patch' | 'put' | 'delete' | 'all';

export type WsRouteHandler<P extends string = ''> = (
  ws: Ws,
  req: IncomingMessage & { params: RouteParameters<P> }
) => void;

type HttpRoutesReflect = {
  [K in KeyList]: <P extends string>(path: P, ...callback: HttpRouteHandler<P>[]) => unknown;
};

export interface HttpRoutes extends HttpRoutesReflect {
  use<P extends string>(path: P, ...callback: (HttpRouteHandler<P> | HttpRoutes)[]): unknown;
  use(...callback: (HttpRouteHandler | HttpRoutes)[]): unknown;
}

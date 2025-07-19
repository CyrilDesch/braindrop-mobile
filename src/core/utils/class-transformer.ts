import "reflect-metadata";
import { ClassTransformOptions, plainToInstance } from "class-transformer";

export const defaultTransformOptions: ClassTransformOptions = {
  enableCircularCheck: true,
  excludeExtraneousValues: false,
  enableImplicitConversion: true,
  exposeUnsetFields: true,
};

export interface AfterConstruct {
  afterConstruct?: () => void;
}

function isAfterConstruct<T>(obj: T): obj is T & AfterConstruct {
  return (
    obj !== null &&
    typeof obj === "object" &&
    "afterConstruct" in obj &&
    typeof (obj as any).afterConstruct === "function"
  );
}

export function transformToClass<T>(
  ClassType: new (...args: any[]) => T,
  data: any,
): T {
  const result = plainToInstance(ClassType, data, defaultTransformOptions) as T;
  if (isAfterConstruct(result)) {
    result.afterConstruct?.();
  }
  return result;
}

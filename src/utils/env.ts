export const isDev = () => {
    return process.env.NEXT_PUBLIC_ENV === "development";
  };
  
  export const isProd = () => {
    return process.env.NEXT_PUBLIC_ENV === "production";
  };
  
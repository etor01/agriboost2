// lib/types.ts

export type PageProps = {
  params: { id: string };
  searchParams?: { [key: string]: string | string[] | undefined };
};
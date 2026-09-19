import { notFound } from "next/navigation";
import { getAvailableYears } from "./content";
export async function requireYear(value: string): Promise<number> {
  if (!/^[1-9]\d{3}$/.test(value)) notFound();
  const year = Number(value);
  if (!(await getAvailableYears()).includes(year)) notFound();
  return year;
}

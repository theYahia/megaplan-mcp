import { z } from "zod";
import { megaplanGet } from "../client.js";

export const getDealsSchema = z.object({
  filter_status: z.string().optional().describe("Filter by deal status"),
  filter_responsible_id: z.string().optional().describe("Filter by responsible employee ID"),
  search: z.string().optional().describe("Search by deal name"),
  limit: z.number().int().min(1).max(100).default(25).describe("Results per page"),
  offset: z.number().int().default(0).describe("Offset for pagination"),
});

export async function handleGetDeals(params: z.infer<typeof getDealsSchema>): Promise<string> {
  const query: Record<string, string> = {
    limit: String(params.limit),
    offset: String(params.offset),
  };
  if (params.filter_status) query["filter[status]"] = params.filter_status;
  if (params.filter_responsible_id) query["filter[responsible]"] = params.filter_responsible_id;
  if (params.search) query["search"] = params.search;

  const result = await megaplanGet("/deal", query);
  return JSON.stringify(result, null, 2);
}

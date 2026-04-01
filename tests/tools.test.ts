import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the client module before importing tools
vi.mock("../src/client.js", () => ({
  megaplanGet: vi.fn(),
  megaplanPost: vi.fn(),
}));

import { megaplanGet, megaplanPost } from "../src/client.js";
import { handleGetTasks, handleCreateTask } from "../src/tools/tasks.js";
import { handleGetDeals, handleCreateDeal } from "../src/tools/deals.js";
import { handleGetProjects } from "../src/tools/projects.js";
import { handleGetEmployees } from "../src/tools/employees.js";
import { handleGetComments, handleCreateComment } from "../src/tools/comments.js";

const mockGet = vi.mocked(megaplanGet);
const mockPost = vi.mocked(megaplanPost);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("get_tasks", () => {
  it("calls /task with correct params", async () => {
    mockGet.mockResolvedValue({ data: [], meta: { totalCount: 0 } });
    const result = await handleGetTasks({ limit: 10, offset: 0, filter_status: "active" });
    expect(mockGet).toHaveBeenCalledWith("/task", {
      limit: "10",
      offset: "0",
      "filter[status]": "active",
    });
    expect(JSON.parse(result)).toHaveProperty("data");
  });

  it("passes search param", async () => {
    mockGet.mockResolvedValue({ data: [] });
    await handleGetTasks({ limit: 25, offset: 0, search: "urgent" });
    expect(mockGet).toHaveBeenCalledWith("/task", expect.objectContaining({ search: "urgent" }));
  });
});

describe("create_task", () => {
  it("posts task with required fields", async () => {
    mockPost.mockResolvedValue({ data: { id: "123" } });
    const result = await handleCreateTask({
      name: "Test task",
      responsible_id: "emp1",
    });
    expect(mockPost).toHaveBeenCalledWith("/task", expect.objectContaining({
      contentType: "Task",
      name: "Test task",
      responsible: { id: "emp1", contentType: "Employee" },
    }));
    const parsed = JSON.parse(result);
    expect(parsed.data.id).toBe("123");
  });

  it("includes optional fields when provided", async () => {
    mockPost.mockResolvedValue({ data: { id: "456" } });
    await handleCreateTask({
      name: "With deadline",
      responsible_id: "emp2",
      description: "Do stuff",
      deadline: "2025-12-31T23:59:59+03:00",
      parent_id: "task0",
    });
    expect(mockPost).toHaveBeenCalledWith("/task", expect.objectContaining({
      description: "Do stuff",
      deadline: "2025-12-31T23:59:59+03:00",
      parent: { id: "task0", contentType: "Task" },
    }));
  });
});

describe("get_deals", () => {
  it("calls /deal with filters", async () => {
    mockGet.mockResolvedValue({ data: [] });
    await handleGetDeals({ limit: 25, offset: 0, filter_responsible_id: "emp1" });
    expect(mockGet).toHaveBeenCalledWith("/deal", expect.objectContaining({
      "filter[responsible]": "emp1",
    }));
  });
});

describe("create_deal", () => {
  it("posts deal with pipeline", async () => {
    mockPost.mockResolvedValue({ data: { id: "d1" } });
    const result = await handleCreateDeal({
      name: "New deal",
      program_id: "prog1",
      amount: 50000,
    });
    expect(mockPost).toHaveBeenCalledWith("/deal", expect.objectContaining({
      contentType: "Deal",
      name: "New deal",
      program: { id: "prog1", contentType: "DealProgram" },
      cost: 50000,
    }));
    expect(JSON.parse(result).data.id).toBe("d1");
  });
});

describe("get_projects", () => {
  it("calls /project", async () => {
    mockGet.mockResolvedValue({ data: [] });
    await handleGetProjects({ limit: 10, offset: 0 });
    expect(mockGet).toHaveBeenCalledWith("/project", { limit: "10", offset: "0" });
  });

  it("passes search filter", async () => {
    mockGet.mockResolvedValue({ data: [] });
    await handleGetProjects({ limit: 25, offset: 0, search: "alpha" });
    expect(mockGet).toHaveBeenCalledWith("/project", expect.objectContaining({ search: "alpha" }));
  });
});

describe("get_employees", () => {
  it("calls /employee", async () => {
    mockGet.mockResolvedValue({ data: [] });
    await handleGetEmployees({ limit: 25, offset: 0 });
    expect(mockGet).toHaveBeenCalledWith("/employee", { limit: "25", offset: "0" });
  });

  it("passes department filter", async () => {
    mockGet.mockResolvedValue({ data: [] });
    await handleGetEmployees({ limit: 25, offset: 0, filter_department_id: "dep1" });
    expect(mockGet).toHaveBeenCalledWith("/employee", expect.objectContaining({
      "filter[department]": "dep1",
    }));
  });
});

describe("get_comments", () => {
  it("calls /task/:id/comment", async () => {
    mockGet.mockResolvedValue({ data: [] });
    await handleGetComments({ subject_type: "task", subject_id: "t1", limit: 25, offset: 0 });
    expect(mockGet).toHaveBeenCalledWith("/task/t1/comment", { limit: "25", offset: "0" });
  });
});

describe("create_comment", () => {
  it("posts comment on deal", async () => {
    mockPost.mockResolvedValue({ data: { id: "c1" } });
    await handleCreateComment({ subject_type: "deal", subject_id: "d1", text: "Hello" });
    expect(mockPost).toHaveBeenCalledWith("/deal/d1/comment", expect.objectContaining({
      contentType: "Comment",
      text: "Hello",
      subject: { id: "d1", contentType: "Deal" },
    }));
  });
});

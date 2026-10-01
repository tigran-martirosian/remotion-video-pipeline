import { topicSchema, type Topic } from "../video/schema";
import { binarySearch } from "./binary-search";

// Every topic config in this folder is listed here; Root registers one composition per entry.
export const topics: Topic[] = [binarySearch].map((t) => topicSchema.parse(t));

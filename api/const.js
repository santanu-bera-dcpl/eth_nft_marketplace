import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PROJECT_DIR = __dirname;

export const PAGINATION = {
    PAGE_LIMIT: 10,
    DEFAULT_PAGE_NUM: 1
};

export const NFT_STATUS = {
    DRAFTED: 'drafted',
    PUBLISHED: 'published',
    UNPUBLISHED: 'unpublished',
    TRASHED: 'trashed'
};
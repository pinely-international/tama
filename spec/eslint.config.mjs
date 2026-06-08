import rootConfig from "../eslint.config.mjs"
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

export default rootConfig;

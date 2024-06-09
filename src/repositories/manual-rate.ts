import { dataSource } from "@medusajs/medusa/dist/loaders/database";
import { ManualRate } from "../models/manual-rate";

const ManualRateRepository = dataSource.getRepository(ManualRate);

export default ManualRateRepository;
import { TransactionBaseService } from "@medusajs/medusa";
import ManualRateRepository from "../repositories/manual-rate";
import { ManualRate } from "../models/manual-rate";

class ManualRateService extends TransactionBaseService {
  protected manualRateRepository_: typeof ManualRateRepository;

  constructor(container) {
    super(container);
    this.manualRateRepository_ = container.manualRateRepository;
  }

  async list(): Promise<ManualRate[]> {
    const manualRateRepo = this.activeManager_.withRepository(
      this.manualRateRepository_
    );
    return await manualRateRepo.find();
  }

  async retrive(id): Promise<ManualRate> {
    const manualRateRepo = this.activeManager_.withRepository(
      this.manualRateRepository_
    );
    return await manualRateRepo.findOne({ where: { id: id } });
  }

  async createRecord(code, rate, expires_at) {
    const manualRateRepo = this.activeManager_.withRepository(
      this.manualRateRepository_
    );
    const newRates = manualRateRepo.create({
      code,
      rate,
      expires_at,
    });
    return await manualRateRepo.save(newRates);
  }

  async deleteById(id): Promise<void> {
    const manualRateRepo = this.activeManager_.withRepository(
      this.manualRateRepository_
    );
    await manualRateRepo.delete({id});
  }

  async updateById(id, data): Promise<ManualRate> {
    const manualRateRepo = this.activeManager_.withRepository(
      this.manualRateRepository_
    );
    await manualRateRepo.update({ id }, data);
    return await manualRateRepo.findOne({ where: { id: id } });
  }
}

export default ManualRateService;

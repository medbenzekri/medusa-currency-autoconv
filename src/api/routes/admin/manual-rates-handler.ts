import { Request, Response } from 'express'
import ManualRateService from "../../../services/manualRate";

export const getRates = async (req: Request, res: Response): Promise<void> => {
    try {
        const manualRateService =
          req.scope.resolve<ManualRateService>("manualRateService");
    
        const manualRates = await manualRateService.list();
        res.status(200).json({rates: manualRates});
      } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Imternal server error");
      }
}

export const getRateById = async (req: Request, res: Response): Promise<void> => {
  try {
      const manualRateService =
        req.scope.resolve<ManualRateService>("manualRateService");
  
      const manualRate = await manualRateService.retrive(req.params.id);
      res.status(200).json({rate: manualRate});
    } catch (error) {
      console.error("Error:", error);
      res.status(500).send("Imternal server error");
    }
}

export const createRate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code, rate, expires_at }=req.body
        const manualRateService =
          req.scope.resolve<ManualRateService>("manualRateService");
    
        const manualRates = await manualRateService.createRecord(code, rate, expires_at);
        res.status(200).json({rates: manualRates});
      } catch (error) {
        console.error("Error creating record:", error);
        res.status(500).send("Imternal server error");
      }
}

export const updateRate = async (req: Request, res: Response): Promise<void> => {
  try {
      const { code, rate, expires_at } = req.body;
      const manualRateService =
          req.scope.resolve<ManualRateService>("manualRateService");
  
      const updatedRate = await manualRateService.updateById(req.params.id, {
          code,
          rate,
          expires_at
      });
      res.status(200).json({ rate: updatedRate });
  } catch (error) {
      console.error("Error updating record:", error);
      res.status(500).send("Internal server error");
  }
}

export const deleteRate = async (req: Request, res: Response): Promise<void> => {
  try {
      const manualRateService =
          req.scope.resolve<ManualRateService>("manualRateService");
      await manualRateService.deleteById(req.params.id);
      res.status(200).json({ message: "Rate deleted successfully" });
  } catch (error) {
      console.error("Error deleting record:", error);
      res.status(500).send("Internal server error");
  }
}
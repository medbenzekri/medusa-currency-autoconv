import { BeforeInsert,BeforeUpdate, Column, Entity, OneToOne, JoinColumn } from "typeorm";
import { generateEntityId } from "@medusajs/utils";
import { BaseEntity, Currency } from "@medusajs/medusa";

@Entity()
export class ManualRate extends BaseEntity {
    @Column({nullable:false})
    code: string;

    @OneToOne(() => Currency,{nullable:false})
    @JoinColumn({name:"code"})
    currency: Currency;

    @Column({ type: 'float' })
    rate: number | null;

    @Column({ type: 'timestamp', default: () =>  "CURRENT_TIMESTAMP + INTERVAL '1' DAY"})
    expires_at: Date;

    @BeforeUpdate()
    private beforeUpdate(): void {
        this.expires_at = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    }    


    @BeforeInsert()
    private beforeInsert(): void {
        this.id = generateEntityId(this.id, "manual")
    }
}
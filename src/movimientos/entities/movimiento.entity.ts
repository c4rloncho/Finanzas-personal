import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Movimiento {
    @PrimaryGeneratedColumn()
    id:Number;
    @Column()
    saldo:number;
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    fecha: Date;
    

}

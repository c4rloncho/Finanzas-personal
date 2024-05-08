import { IsNumber } from "class-validator";
import { Cuenta } from "src/cuenta/entities/cuenta.entity";
import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Transaccion {
    @PrimaryGeneratedColumn()
    id:number;
    
    @Column()
    descripcion:string;

    @ManyToOne(()=>Cuenta, cuenta => cuenta.transacciones)
    @JoinColumn()
    cuenta: Cuenta;

    @Column()
    valor:number;
    @Column()
    fecha:Date;
}

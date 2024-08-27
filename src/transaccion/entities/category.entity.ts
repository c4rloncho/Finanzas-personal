import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Transaccion } from "./transaccion.entity";

@Entity()
export class Categoria {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre: string;

    @Column({ nullable: true })
    descripcion: string;
    
    @Column({ nullable: true })
    color:string;

    @OneToMany(() => Transaccion, transaccion => transaccion.categoria)
    transacciones: Transaccion[];
}
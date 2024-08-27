import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne } from "typeorm";
import { Transaccion } from "./transaccion.entity";
import { Cuenta } from "src/cuenta/entities/cuenta.entity";

@Entity()
export class Categoria {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    nombre: string;

    @Column({ nullable: true })
    descripcion: string;
    
    @Column({ nullable: true })
    color:string;

    @OneToMany(() => Transaccion, transaccion => transaccion.categoria)
    transacciones: Transaccion[];

    @ManyToOne(()=> Cuenta,cuenta => cuenta.categorias)
    cuenta:Cuenta
}
import { User } from "src/entities/user.entity";
import { Transaccion } from "src/transaccion/entities/transaccion.entity";
import { Column, Double, Entity, JoinColumn, ManyToMany, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
@Entity()
export class Cuenta {
    @PrimaryGeneratedColumn()
    id:number;

    @Column({type: 'float8'})
    saldo:number;

    @OneToOne(()=> User, user => user.cuenta)
    user: User;

    @OneToMany(()=>Transaccion, transaccion => transaccion.cuenta)
    transacciones: Transaccion[];

}

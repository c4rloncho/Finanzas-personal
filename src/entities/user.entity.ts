import { Cuenta } from "src/cuenta/entities/cuenta.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    name: string;

    @Column()
    password: string;

    @OneToOne(()=>Cuenta, cuenta => cuenta.user)
    @JoinColumn()
    cuenta:Cuenta;

}

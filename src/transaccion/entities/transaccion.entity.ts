import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Cuenta } from "src/cuenta/entities/cuenta.entity";
import { Categoria } from "./category.entity";

export enum TipoTransaccion {
  REGULAR = 'regular',
  AUTOMATICA = 'automatica',
  REGULAR_ENTRADA = 'regular_entrada',
  AUTOMATICA_ENTRADA = 'automatica_entrada'
}

@Entity()
export class Transaccion {
    @PrimaryGeneratedColumn()
    id: number;
    
    @Column()
    descripcion: string;

    @ManyToOne(() => Cuenta, cuenta => cuenta.transacciones)
    @JoinColumn()
    cuenta: Cuenta;

    @ManyToOne(() => Categoria, categoria => categoria.transacciones)
    @JoinColumn()
    categoria: Categoria;

    @Column('decimal', { precision: 10, scale: 2 })
    monto: number;

    @CreateDateColumn()
    fecha: Date;

    @Column({
      type: 'enum',
      enum: TipoTransaccion,
      default: TipoTransaccion.REGULAR
    })
    tipo: TipoTransaccion;

    // Campos específicos para transacciones automáticas
    @Column({ nullable: true })
    diaCobro?: number;

    @Column({ type: 'timestamp', nullable: true })
    fechaProximoCobro?: Date;

    @Column({ default: false })
    activo: boolean;
}
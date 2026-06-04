import { City } from "src/cities/entities/city.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Country {

@PrimaryGeneratedColumn()
id!:number;
@Column()
name!:string;
@Column()
code!:string;
@OneToMany(()=>City,(city)=>city.country)
cities!:City[];
}

import { Model, Optional } from 'sequelize';
interface ClinicAttributes {
    id: number;
    name: string;
    address: string | null;
    latitude: number;
    longitude: number;
    services: string | null;
    consultationFee: number | null;
    contact: string | null;
    rating: number;
    createdAt?: Date;
    updatedAt?: Date;
}
interface ClinicCreationAttributes extends Optional<ClinicAttributes, 'id' | 'address' | 'services' | 'consultationFee' | 'contact'> {
}
declare class Clinic extends Model<ClinicAttributes, ClinicCreationAttributes> implements ClinicAttributes {
    id: number;
    name: string;
    address: string | null;
    latitude: number;
    longitude: number;
    services: string | null;
    consultationFee: number | null;
    contact: string | null;
    rating: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Clinic;
//# sourceMappingURL=clinic.d.ts.map
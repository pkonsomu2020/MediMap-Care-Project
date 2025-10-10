import { Model, Optional } from 'sequelize';
interface ReviewAttributes {
    id: number;
    userId: number;
    clinicId: number;
    rating: number;
    comment: string | null;
    createdAt?: Date;
    updatedAt?: Date;
}
interface ReviewCreationAttributes extends Optional<ReviewAttributes, 'id' | 'comment'> {
}
declare class Review extends Model<ReviewAttributes, ReviewCreationAttributes> implements ReviewAttributes {
    id: number;
    userId: number;
    clinicId: number;
    rating: number;
    comment: string | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}
export default Review;
//# sourceMappingURL=review.d.ts.map
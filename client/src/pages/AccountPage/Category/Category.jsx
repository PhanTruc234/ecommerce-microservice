import { useCategory } from "@/hooks/category/useCategory";
import { MoveRight } from "lucide-react";
import { Link } from "react-router-dom";


export const Category = ({ data, onNext }) => {
    const { categories, isValidating } = useCategory({ slug: data });
    const name = categories?.[0]?.name;
    const list = categories?.[0]?.children || [];
    console.log(list, "listlist")
    return (
        <section className="category-section">
            <h2 className="category-title">Danh Mục {name}</h2>

            <ul className="category-grid">
                {list.map((child) => (
                    <li
                        key={child.id}
                        className="category-item group"
                    >
                        <div className="category-item category-link">
                            <img
                                src={child.thumbnail}
                                alt=""
                                className="category-img"
                            />
                            <h3 className="category-name">{child.name}</h3>
                            <Link to={`/product?category=${child.slug}`} className="category-btn">
                                <span>Xem</span>
                                <MoveRight size={20} strokeWidth={1.5} />
                            </Link>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="category-footer">
                <button
                    onClick={onNext}
                    disabled={isValidating}
                    className="category-more-btn"
                >
                    {isValidating ? "Đang tải..." : "Xem thêm"}
                </button>
            </div>
        </section>
    );
};

import { useState } from "react";
import { Category } from "./Category";


export const CategorySection = () => {
    const list = ["nam", "nu", "tre-em"];
    const [index, setIndex] = useState(0);

    const handleNext = () => {
        setIndex((prev) => (prev + 1) % list.length);
    };

    return (
        <Category
            data={list[index]}
            onNext={handleNext}
            key={list[index]}
        />
    );
};
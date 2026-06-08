import React from 'react'
import { useParams } from 'react-router-dom';
import { ProductForm } from './ProductForm';

export const ProductEdit = () => {
    const { id } = useParams();
    return (
        <div><ProductForm id={id} /></div>
    )
}

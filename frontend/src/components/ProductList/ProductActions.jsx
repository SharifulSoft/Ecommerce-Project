import React from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function ProductActions({ productId, onView, onEdit, onDelete }) {
  const navigate = useNavigate();

  const handleView = () => {
    if (onView) {
      onView(productId);
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(productId);
    } else {
      navigate(`/admin/products/edit/${productId}`);
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(productId);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* View Button */}
      <button
        onClick={handleView}
        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
        title="View product"
      >
        <Eye size={18} />
      </button>

      {/* Edit Button */}
      <button
        onClick={handleEdit}
        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
        title="Edit product"
      >
        <Edit2 size={18} />
      </button>

      {/* Delete Button */}
      <button
        onClick={handleDelete}
        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
        title="Delete product"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}


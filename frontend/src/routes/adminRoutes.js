import AdminDashboard from '../pages/AdminDashboard';
import AdminUsers from '../pages/AdminUsers';
import AddProduct from '../pages/AddProduct';
import ProductList from '../pages/ProductList';
import EditProduct from '../pages/EditProduct';
import ViewProduct from '../pages/ViewProduct';
import CategoryList from '../pages/CategoryList';
import AddCategory from '../pages/AddCategory';
import EditCategory from '../pages/EditCategory';
import SubCategoryList from '../pages/SubCategoryList';
import AddSubCategory from '../pages/AddSubCategory';
import EditSubCategory from '../pages/EditSubCategory';
import BrandList from '../pages/BrandList';
import AddBrand from '../pages/AddBrand';
import EditBrand from '../pages/EditBrand';
import ProductLabelList from '../pages/ProductLabelList';
import AddProductLabel from '../pages/AddProductLabel';
import EditProductLabel from '../pages/EditProductLabel';
import AttributeList from '../pages/AttributeList';
import AddAttribute from '../pages/AddAttribute';
import EditAttribute from '../pages/EditAttribute';
import MediaLibrary from '../pages/MediaLibrary';
import AdminPageSettings from '../pages/AdminPageSettings';
import AdminHomeSection from '../pages/AdminHomeSection';
import ReviewManagement from '../pages/ReviewManagement';
import ReviewSettings from '../pages/ReviewSettings';
import ReviewAnalytics from '../pages/ReviewAnalytics';
import CouponList from '../pages/CouponList';
import AddCoupon from '../pages/AddCoupon';
import EditCoupon from '../pages/EditCoupon';
import OrderList from '../pages/OrderList';
import CreateOrder from '../pages/CreateOrder';
import EditOrder from '../pages/EditOrder';
import OrderDetail from '../pages/OrderDetail';
import InvoiceView from '../pages/InvoiceView';
import CustomInvoiceGenerator from '../pages/CustomInvoiceGenerator';
import InvoiceList from '../pages/InvoiceList';
import CustomInvoiceView from '../pages/CustomInvoiceView';

export const adminRoutes = [
  {
    path: '/admin',
    element: AdminDashboard,
    name: 'Admin Dashboard',
    description: 'Administrative control panel',
  },
  {
    path: '/admin/users',
    element: AdminUsers,
    name: 'Users',
    description: 'Manage users',
  },
  {
    path: '/admin/products',
    element: ProductList,
    name: 'Products',
    description: 'Manage products',
  },
  {
    path: '/admin/products/add',
    element: AddProduct,
    name: 'Add Product',
    description: 'Add a new product',
  },
  {
    path: '/admin/products/view/:productId',
    element: ViewProduct,
    name: 'View Product',
    description: 'View a product',
  },
  {
    path: '/admin/products/edit/:productId',
    element: EditProduct,
    name: 'Edit Product',
    description: 'Edit a product',
  },
  {
    path: '/admin/category',
    element: CategoryList,
    name: 'Categories',
    description: 'Manage categories',
  },
  {
    path: '/admin/category/add',
    element: AddCategory,
    name: 'Add Category',
    description: 'Add a new category',
  },
  {
    path: '/admin/category/edit/:id',
    element: EditCategory,
    name: 'Edit Category',
    description: 'Edit a category',
  },
  {
    path: '/admin/sub-category',
    element: SubCategoryList,
    name: 'Sub Categories',
    description: 'Manage sub-categories',
  },
  {
    path: '/admin/sub-category/add',
    element: AddSubCategory,
    name: 'Add Sub Category',
    description: 'Add a new sub-category',
  },
  {
    path: '/admin/sub-category/edit/:id',
    element: EditSubCategory,
    name: 'Edit Sub Category',
    description: 'Edit a sub-category',
  },
  {
    path: '/admin/brands',
    element: BrandList,
    name: 'Brands',
    description: 'Manage brands',
  },
  {
    path: '/admin/brands/add',
    element: AddBrand,
    name: 'Add Brand',
    description: 'Add a new brand',
  },
  {
    path: '/admin/brands/edit/:id',
    element: EditBrand,
    name: 'Edit Brand',
    description: 'Edit a brand',
  },
  {
    path: '/admin/product-labels',
    element: ProductLabelList,
    name: 'Product Labels',
    description: 'Manage product labels',
  },
  {
    path: '/admin/product-labels/add',
    element: AddProductLabel,
    name: 'Add Product Label',
    description: 'Add a new product label',
  },
  {
    path: '/admin/product-labels/edit/:id',
    element: EditProductLabel,
    name: 'Edit Product Label',
    description: 'Edit a product label',
  },
  {
    path: '/admin/attributes',
    element: AttributeList,
    name: 'Attributes',
    description: 'Manage product attributes',
  },
  {
    path: '/admin/attributes/add',
    element: AddAttribute,
    name: 'Add Attribute',
    description: 'Add a new attribute',
  },
  {
    path: '/admin/attributes/:id/edit',
    element: EditAttribute,
    name: 'Edit Attribute',
    description: 'Edit an attribute',
  },
  {
    path: '/admin/media',
    element: MediaLibrary,
    name: 'Media Library',
    description: 'Manage media files',
  },
  {
    path: '/admin/pages/:pageId',
    element: AdminPageSettings,
    name: 'Page Settings',
    description: 'Manage page settings',
  },
  {
    path: '/admin/home-sections/:sectionKey',
    element: AdminHomeSection,
    name: 'Home Section',
    description: 'Manage a home page section',
  },
  {
    path: '/admin/reviews',
    element: ReviewManagement,
    name: 'Reviews',
    description: 'Manage product reviews',
  },
  {
    path: '/admin/reviews/settings',
    element: ReviewSettings,
    name: 'Review Settings',
    description: 'Configure review system',
  },
  {
    path: '/admin/reviews/analytics',
    element: ReviewAnalytics,
    name: 'Review Analytics',
    description: 'View review statistics',
  },
  {
    path: '/admin/coupons',
    element: CouponList,
    name: 'Coupons',
    description: 'Manage coupons',
  },
  {
    path: '/admin/coupons/add',
    element: AddCoupon,
    name: 'Add Coupon',
    description: 'Add a new coupon',
  },
  {
    path: '/admin/coupons/edit/:id',
    element: EditCoupon,
    name: 'Edit Coupon',
    description: 'Edit a coupon',
  },
  {
    path: '/admin/orders',
    element: OrderList,
    name: 'Orders',
    description: 'Manage orders',
  },
  {
    path: '/admin/orders/create',
    element: CreateOrder,
    name: 'Create Order',
    description: 'Create a new order',
  },
  {
    path: '/admin/orders/edit/:orderId',
    element: EditOrder,
    name: 'Edit Order',
    description: 'Edit an order',
  },
  {
    path: '/admin/orders/view/:orderId',
    element: OrderDetail,
    name: 'Order Detail',
    description: 'View order details',
  },
  {
    path: '/admin/orders/invoice/:orderId',
    element: InvoiceView,
    name: 'Invoice',
    description: 'View and generate invoice',
  },
  {
    path: '/admin/invoices',
    element: InvoiceList,
    name: 'Invoice List',
    description: 'View all custom invoices',
  },
  {
    path: '/admin/invoices/generate',
    element: CustomInvoiceGenerator,
    name: 'Generate Invoice',
    description: 'Generate a custom invoice',
  },
  {
    path: '/admin/invoices/view/:invoiceId',
    element: CustomInvoiceView,
    name: 'View Invoice',
    description: 'View a custom invoice',
  },
];

export default adminRoutes;

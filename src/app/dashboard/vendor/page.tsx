import VendorDashboardClient from "@/components/dashboard/vendor-dashboard-client";
import { getProductsByVendor, getOrdersByVendor } from "@/lib/firestore-service";

// Mock: In a real app, this would come from the user's session or DB.
const VENDOR_NAME = 'StellarForce';

export default async function VendorDashboardPage() {
    const [vendorProducts, vendorOrders] = await Promise.all([
        getProductsByVendor(VENDOR_NAME),
        getOrdersByVendor(VENDOR_NAME)
    ]);

    return <VendorDashboardClient vendorProducts={vendorProducts} vendorOrders={vendorOrders} vendorName={VENDOR_NAME} />;
}

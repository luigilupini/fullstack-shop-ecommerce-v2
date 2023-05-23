import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import Image from 'next/image';
import priceFormat from '@/utils/priceFormat';

export const revalidate = 0;

async function fetchOrders() {
  const prisma = new PrismaClient();
  // STRIPE: GET USER SESSION INFO FROM NEXTAUTH ⭐️
  // `getServerSession` function, when called within your API route handler,
  // will return user's session object if a session exists. It contains info
  // about the currently authenticated user, such as email, name, image, &
  // any other session data you've chosen to include.
  const user = await getServerSession(authOptions);
  if (!user) return null;
  // FIND ALL USER ORDERS
  const orders = await prisma.order.findMany({
    // 👇🏻 toggle between all orders and completed orders
    where: { userId: (user?.user as any).id },
    // where: { userId: (user?.user as any).id, status: 'complete' },
    include: { products: true },
  });
  return orders;
}

export default async function page() {
  const orders = await fetchOrders();
  let today = new Date();
  console.log('<Dashboard> :', orders);
  if (orders === null) {
    return (
      <div className="text-gray-700">
        <h1 className="text-2xl font-bold">
          Dashboard <span className="font-normal">| Oops!</span>
        </h1>
        <h2 className="mt-1 text-base">Signin to view your orders.</h2>
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <div className="text-gray-700">
        <h1 className="text-2xl font-bold">
          Dashboard <span className="font-normal">| Oops!</span>
        </h1>
        <h2 className="mt-1 text-base">No orders complete :(</h2>
      </div>
    );
  }
  return (
    <div className="h-screen text-gray-700">
      <h1 className="text-2xl font-bold">
        Dashboard <span className="font-normal">| Your Orders</span>
      </h1>
      {/* Your Orders */}
      <div className="flex flex-col gap-4 mt-6">
        {orders?.map((order) => (
          <div
            key={order.id}
            className="relative flex flex-col gap-1 p-2 border-2 border-gray-100 rounded-lg bg-gray-50"
          >
            <h2>Order: {order.id}</h2>
            <p className="text-[13px] text-gray-500">
              {today.toLocaleString('en-US')}
            </p>
            <p className="absolute text-[13px] top-3 right-3">
              Payment:{' '}
              <span
                className={`${
                  order.status === 'complete' ? 'bg-teal-500' : 'bg-orange-500'
                } p-1 text-white rounded-md px-2 mx-2`}
              >
                {order.status}
              </span>
            </p>
            {/* Products in Order */}
            <div className="flex flex-col gap-2 py-2">
              {order.products.map((product) => (
                <div key={product.id} className="flex items-center gap-4 py-1">
                  <Image
                    className="object-cover rounded-full w-9 h-9"
                    src={product.image!}
                    alt={product.name}
                    width={36}
                    height={36}
                    priority
                  />
                  <div className="flex flex-col">
                    <h4 className="text-sm font-semibold">{product.name}</h4>
                    <p className="text-sm">
                      {product.quantity} x {priceFormat(product.unit_amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

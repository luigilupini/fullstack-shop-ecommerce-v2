// PRISMA: BEST PRACTICE FOR INSTANTIATING PRISMA CLIENT WITH NEXT.JS ⭐️
// import { PrismaClient } from '@prisma/client';
import { prisma } from '@/prisma/prisma';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import Image from 'next/image';
import priceFormat from '@/utils/priceFormat';

export const revalidate = 0;

async function fetchOrders() {
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
  let today = (date: string | number | Date) => {
    const day = new Date(date).getDate();
    const month = new Date(date).getMonth();
    const year = new Date(date).getFullYear();
    const time = new Date(date).toLocaleTimeString();
    return `${day}/${month}/${year} - ${time}`;
  };
  // console.log('<Dashboard> :', orders);
  if (orders === null) {
    return (
      <div>
        <h1 className="text-2xl font-bold">
          Dashboard <span className="font-normal">| Oops!</span>
        </h1>
        <h2 className="mt-1 text-base">Signin to view your orders.</h2>
      </div>
    );
  }
  if (orders.length === 0) {
    return (
      <div>
        <h1 className="text-2xl font-bold">
          Dashboard <span className="font-normal">| Oops!</span>
        </h1>
        <h2 className="mt-1 text-base">No orders complete :(</h2>
      </div>
    );
  }
  return (
    <div className="pb-6 overflow-hidden">
      <h1 className="text-2xl font-bold">
        Dashboard <span className="font-normal">| Your Orders</span>
      </h1>
      {/* Your Orders */}
      <div className="flex flex-col gap-4 mt-6">
        {orders?.map((order) => (
          <div
            key={order.id}
            className="relative flex flex-col gap-1 p-2 px-4 rounded-lg shadow-sm bg-base-200"
          >
            <h2>Order: {order.id}</h2>
            <p className="text-[12px]">{today(order.createdDate)}</p>
            <p className="absolute text-[13px] top-4 right-3">
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

/* ALTERATIVE APPROACH
export default function Dashboard() {
  const [orders, setOrders] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const fetchOrders = async () => {
    const res = await fetch("/api/orders")
    const data = await res.json()
    return data
  }
  useEffect(() => {
    fetchOrders()
      .then((data) => {
        setOrders(data)
        setLoading(false)
      })
      .catch((err) => {
        setError(err)
        setLoading(false)
      })
  }, [])
  console.log(orders)
  if (loading) return <p>Loading...</p>
  if (error) return <p>Error: {error}</p>
  return (
    <motion.div layout>
      <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {orders.map((order) => (
          <div
            key={order.id}
            className="p-8 my-4 space-y-2 rounded-lg bg-base-200"
          >
            <h2 className="text-xs font-medium">Order reference: {order.id}</h2>
            <p className="text-xs">
              Status:
              <span
                className={`${
                  order.status === "complete" ? "bg-teal-500" : "bg-orange-500"
                } text-white py-1 rounded-md px-2 mx-2 text-xs`}
              >
                {order.status}
              </span>
            </p>

            <p className="text-xs">
              Time: {new Date(order.createdDate).toString()}
            </p>
            <div className="items-center gap-4 text-sm lg:flex">
              {order.products.map((product) => (
                <div className="py-2" key={product.id}>
                  <h2 className="py-2">{product.name}</h2>
                  <div className="flex items-baseline gap-4">
                    <Image
                      src={product.image!}
                      width={36}
                      height={36}
                      alt={product.name}
                      priority={true}
                      className="w-auto"
                    />
                    <p>{formatPrice(product.unit_amount)}</p>
                    <p>Quantity: {product.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="py-2 font-medium">
              Total: {formatPrice(order.amount)}
            </p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  )
}
*/

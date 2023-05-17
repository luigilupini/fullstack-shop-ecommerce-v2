import { SearchParamTypes } from '@/types/SearchParamType';
import priceFormat from '@/utils/priceFormat';
import Image from 'next/image';

export default async function ProductPage({ searchParams }: SearchParamTypes) {
  // console.log('searchParams: ', searchParams);
  return (
    <div className="flex items-center justify-between gap-16 mt-12">
      <Image
        src={searchParams.images}
        alt={searchParams.name}
        width={600}
        height={600}
        className="object-cover w-full rounded-sm h-96"
        priority={true}
      />

      <div className="text-gray-700">
        <h1 className="py-2 text-2xl font-medium">{searchParams.name}</h1>
        <p className="py-2">{searchParams.description}</p>
        <p className="py-2">{searchParams.features}</p>
        <div className="flex gap-2">
          <p className="font-bold">
            {searchParams.unit_amount && priceFormat(searchParams.unit_amount)}
          </p>
        </div>
        <button className="px-6 py-2 my-12 font-medium text-white duration-300 bg-gray-800 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ">
          Add to cart
        </button>
      </div>
    </div>
  );
}

/* NESTED ROUTING IN APP ROUTER FOLDER ⭐️
You can use the `app` router folder to create shared layouts. A shared layout is
a component that is rendered for all, or some of the routes in your application.
To create a shared `layout`, you create a component file in the `app` directory 
and export it. You can then import the shared `layout` component from any other
component in your application. A `app` router folder supports (nested routing).

Nested routing allows you to create routes that are nested inside other routes,
for example, you could create a route called `/products` & then create a nested
route called `/products/123` accessible by the URL path: /products/123. 

DYNAMIC ROUTES IN APP ROUTER FOLDER ⭐️
To use a dynamic route with the new `app` folder, you first need to create a new
directory called `/product` inside the `app` directory. Inside the directory you
can create a `page.tsx` file that will render the `/product/[id]` route. 

The `[id]` in the route segment of `product` is a dynamic segment that will be
filled in with the product `id` when the route is visited either by selecting a 
`Link` from another page or programmatically via the `useRouter` hook. Example,
if the product ID is 123, the route will be `/product/123`.

```jsx
import { useRouter } from 'next/router';

const ProductPage = () => {
  const router = useRouter();
  const id = router.query.id;

  const [product, loading, error] = useSWR(`/api/products/${id}`);

  if (loading) {
    return <div>Loading...</div>;
  } else if (error) {
    return <div>Error: {error.message}</div>;
  } else {
    return (
      <div>
        <h1>{product.name}</h1>
        <p>{product.description}</p>
      </div>
    );
  }
};

export default ProductPage;
```

You can access the product ID from the `router` object. The object has a query
property that contains the "query parameters" for the current route. The product
ID will be in the id key of the query object. 

# NAVIGATION WITH LINK AND USE ROUTER ⭐️

The `Link` component is used to link to other pages in the application. It is 
used to create an anchor tag that will be rendered as a client-side navigation
link by Next.js. The `Link` component is imported from the `next/link` module.

The `Product` component, uses the `Link` component to link to an `/product/[id]`
route. We pass a product ID as a "query parameter" to the route. The same `Link`
component accepts a `href` prop that is used to specify a URL path of the route
to link to. The `href` prop accepts an object with a `pathname` property that is
used to specify the route our link "links" toward. The `query` property of that
same object is used to specify a query parameters for that route.

The `useRouter` hook is used to access the router object. The router object is
used to access the current route and query parameters. The `useRouter` hook is
imported from the `next/router` module.

The `useRouter` hook allows you to programmatically navigate to different routes
in your application. The hook returns an object with the following properties:

`asPath`: current path of the router.
`hash`: current hash of the router.
`location`: current location of the router.
`match`: current match of the router.
`pathname`: current pathname of the router.
`query`: current query parameters of the router.
`search`: current search parameters of the router.
`history`: history object of the router.
`push`: method to push a new route to the history.
`replace`: method to replace the current route in the history.
`goBack`: method to go back one route in the history.
`goForward`: method to go forward one route in the history.
`isActive`: method to check if the current route is active.
`isCurrent`: method to check if the current route is the same as given route.

You can use the `useRouter` hook to navigate to a different route by calling the
`push` or `replace` methods. The push method will add a new route to the history
while the replace method will replace the current route in history. */

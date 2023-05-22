export type SearchParamTypes = {
  params: Params;
  searchParams: SearchParams;
};

type Params = {
  id: string;
};

type SearchParams = {
  name: string;
  unit_amount: number | null;
  image: string;
  id: string;
  description: string | null;
  features: string;
};

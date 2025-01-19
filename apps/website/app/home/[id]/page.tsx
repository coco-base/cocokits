
export default function HomeByIdPage({ params }: { params: { id: string } }) {
  return <h1>Welcome to Home page for ID: {params.id}</h1>;
}
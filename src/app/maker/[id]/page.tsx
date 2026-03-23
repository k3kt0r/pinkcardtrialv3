import { redirect } from "next/navigation"

export default function MakerPage({ params }: { params: { id: string } }) {
  redirect(`/tap/${params.id}`)
}

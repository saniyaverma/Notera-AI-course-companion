import Card from "@/components/ui/Card";

interface EmptyTabProps {
  message: string;
}

export default function EmptyTab({ message }: EmptyTabProps) {
  return (
    <Card className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <p className="text-sm text-zinc-500">{message}</p>
    </Card>
  );
}
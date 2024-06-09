import { RouteConfig } from "@medusajs/admin";
import {
  CurrencyDollarSolid,
  EllipsisHorizontal,
  Trash,
  PencilSquare,
} from "@medusajs/icons";
import {
  Container,
  Toaster,
  Button,
  Table,
  DropdownMenu,
} from "@medusajs/ui";
import { useNavigate } from "react-router-dom";
import { useAdminCustomPost, useAdminCustomQuery } from "medusa-react";

const Rates = () => {
  const navigate = useNavigate();
  const { data, refetch, isLoading } = useAdminCustomQuery(`/manual-rates`, [
    "get_manual_rates",
  ]);
  console.log(data)
  return (
    <>
      <Container title="Rates" className="mb-5">
        {/* <Tabs defaultValue="manual">
          <Tabs.List>
            <Tabs.Trigger value="manual">Manual Rates</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="manual"> */}
            <header style={{ marginLeft: "90%", marginBottom: "2%" }}>
              <Button
                variant="transparent"
                className="border border-gray-200"
                onClick={() => navigate(`/a/rates/add`)}
              >
                Add New
              </Button>
            </header>
            <main>
              {!isLoading && (
                <div>
                  <Table>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell className="w-2/7">
                          Code
                        </Table.HeaderCell>
                        <Table.HeaderCell className="w-2/7">
                          Rate
                        </Table.HeaderCell>
                        <Table.HeaderCell className="w-2/7">
                          Expires At
                        </Table.HeaderCell>
                        <Table.HeaderCell className="w-1/7"></Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {data?.rates.length !== 0
                        ? data?.rates?.map((rate) => {
                            return (
                              <Table.Row
                                key={rate.id}
                                className="[&_td:last-child]:w-[1%] [&_td:last-child]:whitespace-nowrap"
                              >
                                <Table.Cell>{rate.code}</Table.Cell>
                                <Table.Cell>{rate.rate}</Table.Cell>
                                <Table.Cell>{rate.expires_at}</Table.Cell>
                                <Table.Cell>
                                  <ActionButtons
                                    id={rate.id}
                                    refetch={refetch}
                                    isLoading={isLoading}
                                  />
                                </Table.Cell>
                              </Table.Row>
                            );
                          })
                        : "There is no currency selected as manual rate setting"}
                    </Table.Body>
                  </Table>
                </div>
              )}
            </main>
          {/* </Tabs.Content>
        </Tabs> */}
      </Container>
    </>
  );
};

function ActionButtons({
  id,
  refetch,
  isLoading,
}: {
  id: string;
  refetch: () => void;
  isLoading: boolean;
}) {
  const { mutate: deleteRate } = useAdminCustomPost(`manual-rates/${id}/delete`, [
    "delete-rate",
  ]);
  const navigate = useNavigate();
  function handleDeletePage() {
    deleteRate({}, {
      onSuccess: () => {
        refetch();
      },
      onError: (err) => {
        console.log(err);
      },
    });
  }
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <EllipsisHorizontal />
      </DropdownMenu.Trigger>

      <DropdownMenu.Content>
        <DropdownMenu.Item
          className="gap-x-2"
          onClick={() => navigate(`/a/rates/${id}`)}
        >
          <PencilSquare /> Edit
        </DropdownMenu.Item>
        <DropdownMenu.Item
          className="gap-x-2 text-red-500"
          onClick={handleDeletePage}
        >
          <Trash />
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
}

export const config: RouteConfig = {
  link: {
    label: "Rate Settings",
    icon: CurrencyDollarSolid,
  },
};

export default Rates;

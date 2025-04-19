import { useEffect, useState } from "react";
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
//import { useAuthenticator } from '@aws-amplify/ui-react';
import * as React from "react";
import Table from "@cloudscape-design/components/table";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import TextFilter from "@cloudscape-design/components/text-filter";
import Header from "@cloudscape-design/components/header";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences from "@cloudscape-design/components/collection-preferences";
import Link from "@cloudscape-design/components/link";

const client = generateClient<Schema>();

// const { data: todos } = await client.models.Todo.list()

// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>

function ScaList() {
  const [scas, setScas] = useState<Array<Schema["Sca"]["type"]>>([]);

//  const { signOut } = useAuthenticator();

  useEffect(() => {
    client.models.Sca.observeQuery().subscribe({
      next: (data) => setScas([...data.items]),
    });
  }, []);

  //function deleteSca(id: string) {
  //  client.models.Sca.delete({ id })
  //}

  //function createSca() {
    // This function will call a new page to enter data for new SCA
    // Ideally this data would come from Bedrock agent, and this is not needed
  //  client.models.Sca.create({ partner: window.prompt("Partner name"), contract_name: window.prompt("Contract Name") });
  //}

  const [
    selectedItems,
//    setSelectedItems
  ] = React.useState([{ name: "Item 2" }]);

  return (
// const { data: todos } = await client.models.Todo.list()
// return <ul>{todos.map(todo => <li key={todo.id}>{todo.content}</li>)}</ul>
//    {scas.map((sca) => (
//  const { data: scas } = await client.models.Sca.list()
//      {scas.map((_Sca: any, _id: any) => )
      <Table
        items={scas}
        renderAriaLive={({
          firstIndex,
          lastIndex,
          totalItemsCount
        }) =>
          `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`
        }
//        onSelectionChange={({ detail }) =>
//          setSelectedItems(detail.selectedItems)
//        }
//        selectedItems={selectedItems}
//        ariaLabels={{
//          selectionGroupLabel: "Items selection",
//          allItemsSelectionLabel: () => "select all",
//          itemSelectionLabel: ({ selectedItems }, item) =>
//            item.id
//        }}
        columnDefinitions={[
          {
            id: "partner",
            header: "Partner",
            cell: item => <Link href="#">{item.partner}</Link>,
            sortingField: "name",
            isRowHeader: true
          },
          {
            id: "contract_name",
            header: "SCA",
            cell: item => item.contract_name,
            sortingField: "alt"
          },
          {
            id: "contract_type",
            header: "Type",
            cell: item => item.contract_type
          },
          {
            id: "contract_description",
            header: "Description",
            cell: item => item.contract_description
          }
        ]}
        columnDisplay={[
          { id: "partner", visible: true },
          { id: "contract_name", visible: true },
          { id: "contract_type", visible: true },
          { id: "contract_description", visible: true }
        ]}
        enableKeyboardNavigation
        
        loadingText="Loading resources"
        selectionType="multi"
        trackBy="name"
        empty={
          <Box
            margin={{ vertical: "xs" }}
            textAlign="center"
            color="inherit"
          >
            <SpaceBetween size="m">
              <b>No resources</b>
              <Button>Create resource</Button>
            </SpaceBetween>
          </Box>
        }
        filter={
          <TextFilter
            filteringPlaceholder="Find SCA"
            filteringText=""
            countText="0 matches"
          />
        }
        header={
          <Header
            counter={
              selectedItems.length
                ? "(" + selectedItems.length + "/10)"
                : "(10)"
            }
          >
            SCA List
          </Header>
        }
        pagination={
          <Pagination currentPageIndex={1} pagesCount={2} />
        }
        preferences={
          <CollectionPreferences
            title="Preferences"
            confirmLabel="Confirm"
            cancelLabel="Cancel"
            preferences={{
              pageSize: 10,
              contentDisplay: [
                { id: "variable", visible: true },
                { id: "value", visible: true },
                { id: "type", visible: true },
                { id: "description", visible: true }
              ]
            }}
            pageSizePreference={{
              title: "Page size",
              options: [
                { value: 10, label: "10 resources" },
                { value: 20, label: "20 resources" }
              ]
            }}
            wrapLinesPreference={{}}
            stripedRowsPreference={{}}
            contentDensityPreference={{}}
            contentDisplayPreference={{
              options: [
                {
                  id: "variable",
                  label: "Variable name",
                  alwaysVisible: true
                },
                { id: "value", label: "Text value" },
                { id: "type", label: "Type" },
                { id: "description", label: "Description" }
              ]
            }}
            stickyColumnsPreference={{
              firstColumns: {
                title: "Stick first column(s)",
                description:
                  "Keep the first column(s) visible while horizontally scrolling the table content.",
                options: [
                  { label: "None", value: 0 },
                  { label: "First column", value: 1 },
                  { label: "First two columns", value: 2 }
                ]
              },
              lastColumns: {
                title: "Stick last column",
                description:
                  "Keep the last column visible while horizontally scrolling the table content.",
                options: [
                  { label: "None", value: 0 },
                  { label: "Last column", value: 1 }
                ]
              }
            }}
          /> 
        }
      />
    )}
    







export default ScaList;
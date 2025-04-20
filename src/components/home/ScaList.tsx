import { useEffect, useState } from "react";
import type { Schema } from "../../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import Table from "@cloudscape-design/components/table";
import Box from "@cloudscape-design/components/box";
import SpaceBetween from "@cloudscape-design/components/space-between";
import Button from "@cloudscape-design/components/button";
import TextFilter from "@cloudscape-design/components/text-filter";
import Header from "@cloudscape-design/components/header";
import Pagination from "@cloudscape-design/components/pagination";
import CollectionPreferences, { CollectionPreferencesProps } from "@cloudscape-design/components/collection-preferences";
import Link from "@cloudscape-design/components/link";
import { useNavigate } from "react-router-dom";

const client = generateClient<Schema>();

interface Preferences {
  pageSize: number;
  contentDisplay: Array<{
    id: string;
    visible: boolean;
  }>;
}

function ScaList() {
  const [scas, setScas] = useState<Array<Schema["Sca"]["type"]>>([]);
  const [selectedItems, setSelectedItems] = useState<Array<Schema["Sca"]["type"]>>([]);
  const [filteringText, setFilteringText] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<Array<Schema["Sca"]["type"]>>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<Preferences>({
    pageSize: 10,
    contentDisplay: [
      { id: "partner", visible: true },
      { id: "contract_name", visible: true },
      { id: "contract_type", visible: true },
      { id: "contract_description", visible: true }
    ]
  });
  
  const navigate = useNavigate();

  const handleScaClick = (item: Schema["Sca"]["type"]) => {
    navigate('/scadetail', { state: { item } });
  };

  useEffect(() => {
    const subscription = client.models.Sca.observeQuery().subscribe({
      next: ({ items }) => {
        const newItems = [...items];
        setScas(newItems);
        setFilteredItems(newItems);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleFiltering = (text: string) => {
    if (text === undefined) {
      setFilteringText('');
      setFilteredItems(scas);
      return;
    }
    
    setFilteringText(text);
    
    const filtered = scas.filter(
      item => 
        (item.partner?.toLowerCase() || '').includes(text.toLowerCase()) ||
        (item.contract_name?.toLowerCase() || '').includes(text.toLowerCase()) ||
        (item.contract_type?.toLowerCase() || '').includes(text.toLowerCase()) ||
        (item.contract_description?.toLowerCase() || '').includes(text.toLowerCase())
    );
    
    setFilteredItems(filtered);
  };

  const handlePreferencesChange: CollectionPreferencesProps['onConfirm'] = ({ detail }) => {
    setPreferences({
      pageSize: detail.pageSize || 10,
      contentDisplay: [...(detail.contentDisplay || [])] // Spread operator to create a mutable copy
    });
  };

  return (
    <Table
      items={filteredItems || []}
      loading={isLoading}
      renderAriaLive={({firstIndex, lastIndex, totalItemsCount}) =>
        `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`
      }
      onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
      selectedItems={selectedItems}
      ariaLabels={{
        selectionGroupLabel: "Items selection",
        allItemsSelectionLabel: () => "select all",
      }}
      columnDefinitions={[
        {
          id: "partner",
          header: "Partner",
          cell: item => item.partner,
          sortingField: "name",
          isRowHeader: true
        },
        {
          id: "contract_name",
          header: "SCA",
          cell: item => (
            <Link 
              onFollow={() => handleScaClick(item)}
//              href="#"
            >
              {item.contract_name}
            </Link>
          ),
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
      columnDisplay={preferences.contentDisplay}
      enableKeyboardNavigation
      loadingText="Loading resources"
      selectionType="multi"
      trackBy="name"
      empty={
        <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
          <SpaceBetween size="m">
            <b>No resources</b>
            <Button>Create resource</Button>
          </SpaceBetween>
        </Box>
      }
      filter={
        <TextFilter
          filteringPlaceholder="Find SCA"
          filteringText={filteringText || ''}
          onChange={({ detail }) => handleFiltering(detail.filteringText)}
          countText={filteredItems ? `${filteredItems.length} matches` : "0 matches"}
          disabled={false}
        />
      }
      header={
        <Header
          counter={selectedItems.length ? `(${selectedItems.length}/10)` : "(10)"}
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
          onConfirm={handlePreferencesChange}
          preferences={preferences}
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
              { id: "variable", label: "Variable name", alwaysVisible: true },
              { id: "value", label: "Text value" },
              { id: "type", label: "Type" },
              { id: "description", label: "Description" }
            ]
          }}
          stickyColumnsPreference={{
            firstColumns: {
              title: "Stick first column(s)",
              description: "Keep the first column(s) visible while horizontally scrolling the table content.",
              options: [
                { label: "None", value: 0 },
                { label: "First column", value: 1 },
                { label: "First two columns", value: 2 }
              ]
            },
            lastColumns: {
              title: "Stick last column",
              description: "Keep the last column visible while horizontally scrolling the table content.",
              options: [
                { label: "None", value: 0 },
                { label: "Last column", value: 1 }
              ]
            }
          }}
        />
      }
    />
  );
}

export default ScaList;
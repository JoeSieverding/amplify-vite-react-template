import { useCallback, useEffect, useState } from "react";
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
import ButtonDropdown from "@cloudscape-design/components/button-dropdown";
import Modal from "@cloudscape-design/components/modal";
import Input from "@cloudscape-design/components/input";
import { serializeData } from '../../utils/dataSerializer';
import { NonCancelableEventHandler } from "@cloudscape-design/components/internal/events";
import { TableProps } from "@cloudscape-design/components/table";
import ScaImportChatBot from "./ScaImportChatBot";
import SegmentedControl from "@cloudscape-design/components/segmented-control";

const client = generateClient<Schema>();

interface Preferences {
  pageSize: number;
  contentDisplay: Array<{
    id: string;
    visible: boolean;
  }>;
}

type SortableFields = "partner" | "contract_name" | "is_tech" | "contract_type" | "contract_description";

interface SortingColumn {
  sortingField: SortableFields;
}

type ScaType = Schema["Sca"]["type"];

function ScaList() {
  const [scas, setScas] = useState<ScaType[]>([]);
  const [selectedItems, setSelectedItems] = useState<ScaType[]>([]);
  const [filteringText, setFilteringText] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<ScaType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportScaModal, setShowImportScaModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [sortingColumn, setSortingColumn] = useState<SortingColumn>({ sortingField: "partner" });
  const [sortingDescending, setSortingDescending] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'biz'>('all');
  const [preferences, setPreferences] = useState<Preferences>({
    pageSize: 10,
    contentDisplay: [
      { id: "partner", visible: true },
      { id: "contract_name", visible: true },
      { id: "is_tech", visible: true },
      { id: "contract_type", visible: true },
      { id: "contract_description", visible: true }
    ]
  });
  
  const navigate = useNavigate();

  const getTotalPages = () => {
    return Math.ceil((filteredItems?.length || 0) / preferences.pageSize);
  };

  const getCurrentPageItems = () => {
    const startIndex = (currentPageIndex - 1) * preferences.pageSize;
    const endIndex = startIndex + preferences.pageSize;
    return filteredItems.slice(startIndex, endIndex);
  };

  const handleScaClick = (item: ScaType) => {
    const cleanItem = JSON.parse(JSON.stringify(item));
    navigate('/scadetail', { state: { item: cleanItem } });
  };

  const handleActionClick = ({ detail }: { detail: { id: string } }) => {
    switch (detail.id) {
      case 'delete':
        handleDeleteScas();
        break;
      case 'add':
        setShowImportScaModal(true);
        break;
    }
  };

  const handleDeleteScas = () => {
    if (selectedItems.length === 0) {
      return;
    }
    setShowDeleteModal(true);
  };
  
  const handleConfirmDelete = async () => {
    if (deleteConfirmationText.toLowerCase() !== 'delete') {
      return;
    }
  
    try {
      for (const item of selectedItems) {
        await client.models.Sca.delete(item);
      }
      
      setSelectedItems([]);
      setShowDeleteModal(false);
      setDeleteConfirmationText('');
      
    } catch (error) {
      console.error('Error deleting SCAs:', error);
    }
  };

  const handleSorting: NonCancelableEventHandler<TableProps.SortingState<ScaType>> = ({ detail }) => {
    setSortingColumn(detail.sortingColumn as SortingColumn);
    setSortingDescending(detail.isDescending ?? false); // Add null coalescing operator
    
    const sortedItems = [...filteredItems].sort((a, b) => {
      const field = detail.sortingColumn.sortingField as SortableFields;
      const aValue = String(a[field] || '').toLowerCase();
      const bValue = String(b[field] || '').toLowerCase();
      
      if (detail.isDescending) {
        return bValue.localeCompare(aValue);
      }
      return aValue.localeCompare(bValue);
    });
    
    setFilteredItems(sortedItems);
  };
  
  // Define handleFiltering before it's used in useEffect
  const handleFiltering = useCallback((text: string = '', type: 'all' | 'biz' = filterType) => {
    if (text === undefined) {
      text = '';
    }
    
    setFilteringText(text);
    
    // First filter by text
    let filtered = text ? scas.filter(
      item => 
        (item.partner?.toLowerCase() || '').includes(text.toLowerCase()) ||
        (item.contract_name?.toLowerCase() || '').includes(text.toLowerCase()) ||
        (item.is_tech?.toLowerCase() || '').includes(text.toLowerCase()) ||
        (item.contract_type?.toLowerCase() || '').includes(text.toLowerCase()) ||
        (item.contract_description?.toLowerCase() || '').includes(text.toLowerCase())
    ) : [...scas];
    
    // Then apply type filter
    if (type === 'all') {
      // Tech+Biz should show only SCAs with is_tech = true
      filtered = filtered.filter(item => item.is_tech === 'true');
    }
    // For 'biz' type, show all SCAs (no additional filtering)
    
    setFilteredItems(filtered);
    setCurrentPageIndex(1);
  }, [scas, filterType]);
  
  // Handle filter type change
  const handleFilterTypeChange = useCallback((type: 'all' | 'biz') => {
    setFilterType(type);
    handleFiltering(filteringText, type);
  }, [filteringText, handleFiltering]);
  
  // Now we can use handleFiltering in useEffect
  useEffect(() => {
    const subscription = client.models.Sca.observeQuery().subscribe({
      next: ({ items }: { items: ScaType[] }) => {
        const newItems = serializeData([...items]);
        // Sort items by partner and then by contract_name (SCA)
        const sortedItems = [...newItems].sort((a, b) => {
          // First compare partners
          const aPartner = String(a.partner || '').toLowerCase();
          const bPartner = String(b.partner || '').toLowerCase();
          const partnerComparison = aPartner.localeCompare(bPartner);
          
          // If partners are the same, compare contract names
          if (partnerComparison === 0) {
            const aContract = String(a.contract_name || '').toLowerCase();
            const bContract = String(b.contract_name || '').toLowerCase();
            return aContract.localeCompare(bContract);
          }
          
          return partnerComparison;
        });
        setScas(sortedItems);
        
        // Apply current filters to the new data
        handleFiltering(filteringText, filterType);
        setIsLoading(false);
      }
    });
  
    return () => subscription.unsubscribe();
  }, [handleFiltering, filteringText, filterType]);
  
  // Custom filter component with text filter and segmented control
  const CustomFilter = () => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ marginRight: '16px' }}>
        <SegmentedControl
          selectedId={filterType}
          onChange={({ detail }) => handleFilterTypeChange(detail.selectedId as 'all' | 'biz')}
          label="Filter by type"
          options={[
            { id: 'all', text: 'Has Tech' },
            { id: 'biz', text: 'All SCAs' }
          ]}
        />
      </div>
      <div style={{ width: '50%' }}>
        <TextFilter
          filteringPlaceholder="Find SCA"
          filteringText={filteringText || ''}
          onChange={({ detail }) => handleFiltering(detail.filteringText)}
          countText={filteredItems ? `${filteredItems.length} matches` : "0 matches"}
          disabled={false}
        />
      </div>
    </div>
  );

  const handlePreferencesChange: CollectionPreferencesProps['onConfirm'] = ({ detail }) => {
    setPreferences({
      pageSize: detail.pageSize || 10,
      contentDisplay: [...(detail.contentDisplay || [])]
    });
    setCurrentPageIndex(1);
  };

  return (
    <>
      <Table
        items={getCurrentPageItems()}
        loading={isLoading}
        renderAriaLive={({ firstIndex, lastIndex, totalItemsCount }) => 
          `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`
        }
        onSelectionChange={({ detail }) => setSelectedItems(detail.selectedItems)}
        selectedItems={selectedItems}
        ariaLabels={{
          selectionGroupLabel: "Items selection",
          allItemsSelectionLabel: () => "select all",
        }}
        sortingColumn={sortingColumn}
        sortingDescending={sortingDescending}
        onSortingChange={handleSorting}
        columnDefinitions={[
          {
            id: "partner",
            header: "Partner",
            cell: item => item.partner,
            sortingField: "partner" as SortableFields,
            isRowHeader: true
          },
          {
            id: "contract_name",
            header: "SCA",
            cell: item => (
              <Link onFollow={() => handleScaClick(item)}>
                {item.contract_name}
              </Link>
            ),
            sortingField: "contract_name" as SortableFields
          },
          {
            id: "is_tech",
            header: "Has Tech?",
            cell: item => item.is_tech === "true" ? "Yes" : item.is_tech === "false" ? "No" : "-",
            sortingField: "is_tech" as SortableFields
          },
          {
            id: "contract_type",
            header: "Type",
            cell: item => item.contract_type,
            sortingField: "contract_type" as SortableFields
          },
          {
            id: "contract_description",
            header: "Description",
            cell: item => item.contract_description,
            sortingField: "contract_description" as SortableFields
          }
        ]}
        columnDisplay={preferences.contentDisplay}
        enableKeyboardNavigation
        loadingText="Loading resources"
        selectionType="multi"
        trackBy="id"
        empty={
          <Box margin={{ vertical: "xs" }} textAlign="center" color="inherit">
            <SpaceBetween size="m">
              <b>No resources</b>
              <Button>Create resource</Button>
            </SpaceBetween>
          </Box>
        }
        filter={<CustomFilter />}
        header={
          <Header counter={selectedItems.length ? `(${selectedItems.length}/${filteredItems.length})` : `(${filteredItems.length})`}>
            SCA List<span>     </span>
            <ButtonDropdown
              items={[
                { text: "List SCAs", id: "rm", disabled: false },
                {
                  id: "add",
                  text: "Upload SCA",
                  disabled: false
                },
                {
                  text: "Delete Selected",
                  id: "delete",
                  disabled: selectedItems.length === 0
                },
                {
                  id: "view",
                  text: "View metrics",
                  href: "https://example.com",
                  external: true,
                  externalIconAriaLabel: "(opens in new tab)"
                }
              ]}
              onItemClick={handleActionClick}
            >
              Actions
            </ButtonDropdown>
          </Header>
        }
        pagination={
          <Pagination
            currentPageIndex={currentPageIndex}
            pagesCount={getTotalPages()}
            ariaLabels={{
              nextPageLabel: 'Next page',
              previousPageLabel: 'Previous page',
              pageLabel: pageNumber => `Page ${pageNumber} of ${getTotalPages()}`,
              paginationLabel: 'Pagination'
            }}
            onChange={({ detail }) => {
              setCurrentPageIndex(detail.currentPageIndex);
            }}
            disabled={isLoading}
          />
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
                { value: 20, label: "20 resources" },
                { value: 50, label: "50 resources" }
              ]
            }}
            wrapLinesPreference={{}}
            stripedRowsPreference={{}}
            contentDensityPreference={{}}
            contentDisplayPreference={{
              options: [
                { id: "partner", label: "Partner", alwaysVisible: true },
                { id: "contract_name", label: "SCA" },
                { id: "is_tech", label: "Has Tech?" },
                { id: "contract_type", label: "Type" },
                { id: "contract_description", label: "Description" }
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
      {/* Delete Modal */}
      <Modal
        visible={showDeleteModal}
        onDismiss={() => setShowDeleteModal(false)}
        header="Confirm Deletion"
        closeAriaLabel="Close dialog"
        footer={
          <Box float="right">
            <SpaceBetween direction="horizontal" size="xs">
              <Button variant="link" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmDelete}
                disabled={deleteConfirmationText.toLowerCase() !== 'delete'}
              >
                Delete
              </Button>
            </SpaceBetween>
          </Box>
        }
      >
        <SpaceBetween size="m">
          <Box>
            Are you sure you want to delete {selectedItems.length} selected item(s)?
            Type 'delete' to confirm.
          </Box>
          <Input
            value={deleteConfirmationText}
            onChange={({ detail }) => setDeleteConfirmationText(detail.value)}
            placeholder="Type 'delete' to confirm"
          />
        </SpaceBetween>
      </Modal>

      {/* Upload SCA Modal */}
      <Modal
        visible={showImportScaModal}
        onDismiss={() => setShowImportScaModal(false)}
        header="Upload SCA"
        closeAriaLabel="Close dialog"
        size="large"
      >
        <ScaImportChatBot />
      </Modal>
    </>
  );
}

export default ScaList;
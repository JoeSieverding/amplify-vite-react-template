import { useCallback, useEffect, useState, useRef } from "react";
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
import Spinner from "@cloudscape-design/components/spinner";

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
  const [, setScas] = useState<ScaType[]>([]);
  const [techScas, setTechScas] = useState<ScaType[]>([]);
  const [allScas, setAllScas] = useState<ScaType[]>([]);
  const [selectedItems, setSelectedItems] = useState<ScaType[]>([]);
  const [filteringText, setFilteringText] = useState<string>('');
  const [filteredItems, setFilteredItems] = useState<ScaType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportScaModal, setShowImportScaModal] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [sortingColumn, setSortingColumn] = useState<SortingColumn>({ sortingField: "partner" });
  const [sortingDescending, setSortingDescending] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'biz'>('biz'); // Default to 'biz' (All SCAs)
  const debounceTimeoutRef = useRef<number | null>(null);
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
  
  // Apply text filter to a dataset
  const applyTextFilter = useCallback((items: ScaType[], text: string) => {
    if (!text) return items;
    
    return items.filter(item => 
      (item.partner?.toLowerCase() || '').includes(text.toLowerCase()) ||
      (item.contract_name?.toLowerCase() || '').includes(text.toLowerCase()) ||
      (item.contract_type?.toLowerCase() || '').includes(text.toLowerCase()) ||
      (item.contract_description?.toLowerCase() || '').includes(text.toLowerCase())
    );
  }, []);
  
  // Optimized filtering function with visual feedback
  const handleFiltering = useCallback((text: string = '', type: 'all' | 'biz' = filterType) => {
    if (text === undefined) {
      text = '';
    }
    
    // Show filtering indicator
    setIsFiltering(true);
    setFilteringText(text);
    
    // Use setTimeout to allow UI to update before performing filtering
    setTimeout(() => {
      console.time('filter-operation');
      
      // Use pre-filtered datasets
      let filtered: ScaType[];
      
      if (type === 'all') {
        // For "Has Tech" filter, use pre-filtered tech SCAs
        filtered = techScas;
      } else {
        // For "All SCAs", use all SCAs
        filtered = allScas;
      }
      
      // Apply text filter if needed
      if (text) {
        filtered = applyTextFilter(filtered, text);
      }
      
      setFilteredItems(filtered);
      setCurrentPageIndex(1);
      
      console.timeEnd('filter-operation');
      setIsFiltering(false);
    }, 10); // Small delay to allow UI update
  }, [filterType, techScas, allScas, applyTextFilter]);
  
  // Debounced text filter handler with type safety
const debouncedTextFilter = useCallback((text: string) => {
  // Clear any pending debounce
  if (debounceTimeoutRef.current !== null) {
    clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = null;
  }
  
  // Set a new debounce timeout
  debounceTimeoutRef.current = window.setTimeout(() => {
    handleFiltering(text, filterType);
    debounceTimeoutRef.current = null;
  }, 300); // 300ms debounce
}, [handleFiltering, filterType]);
  
  // Handle filter type change with visual feedback
  const handleFilterTypeChange = useCallback((type: 'all' | 'biz') => {
    setIsFiltering(true);
    setFilterType(type);
    
    // Use pre-filtered data instead of filtering again
    setTimeout(() => {
      if (type === 'all') {
        // Apply text filter to tech SCAs if needed
        let filtered = techScas;
        if (filteringText) {
          filtered = applyTextFilter(filtered, filteringText);
        }
        setFilteredItems(filtered);
      } else {
        // Apply text filter to all SCAs if needed
        let filtered = allScas;
        if (filteringText) {
          filtered = applyTextFilter(filtered, filteringText);
        }
        setFilteredItems(filtered);
      }
      setCurrentPageIndex(1);
      setIsFiltering(false);
    }, 10);
  }, [filteringText, techScas, allScas, applyTextFilter]);
  
  // Memoized sort function to avoid recreating it on each render
  const sortItems = useCallback((items: ScaType[]) => {
    return [...items].sort((a, b) => {
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
  }, []);

  // Load and pre-filter data
  useEffect(() => {
    const subscription = client.models.Sca.observeQuery().subscribe({
      next: ({ items }: { items: ScaType[] }) => {
        const newItems = serializeData([...items]);
        
        // Debug: Log the is_tech values
        console.log("SCA items with is_tech values:", 
          newItems.map(item => ({ 
            id: item.id, 
            name: item.contract_name, 
            is_tech: item.is_tech
          }))
        );
        
        const sortedItems = sortItems(newItems);
        
        // Pre-filter the data - use strict comparison with 'true'
        const techItems = sortedItems.filter(item => item.is_tech === 'true');
        
        // Debug: Log the filtered tech items
        console.log("Tech items count:", techItems.length);
        console.log("Tech items:", techItems.map(item => item.contract_name));
        
        setScas(sortedItems);
        setTechScas(techItems);
        setAllScas(sortedItems);
        
        // Apply initial filter based on current filter type
        if (filterType === 'all') {
          setFilteredItems(applyTextFilter(techItems, filteringText));
        } else {
          setFilteredItems(applyTextFilter(sortedItems, filteringText));
        }
        
        setIsLoading(false);
      }
    });
  
    return () => subscription.unsubscribe();
  }, [sortItems, filterType, filteringText, applyTextFilter]);
  
  // Custom filter component with text filter, segmented control, and loading indicator
  const CustomFilter = () => (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ marginRight: '16px', display: 'flex', alignItems: 'center' }}>
        <SegmentedControl
          selectedId={filterType}
          onChange={({ detail }) => handleFilterTypeChange(detail.selectedId as 'all' | 'biz')}
          label="Filter by type"
          options={[
            { id: 'all', text: 'Has Tech' },
            { id: 'biz', text: 'All SCAs' }
          ]}
        />
        {isFiltering && (
          <div style={{ marginLeft: '8px' }}>
            <Spinner size="normal" />
          </div>
        )}
      </div>
      <div style={{ width: '50%' }}>
        <TextFilter
          filteringPlaceholder="Find SCA"
          filteringText={filteringText || ''}
          onChange={({ detail }) => debouncedTextFilter(detail.filteringText)}
          countText={filteredItems ? `${filteredItems.length} matches` : "0 matches"}
          disabled={isFiltering}
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
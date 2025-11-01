import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { OverlayPanel } from "primereact/overlaypanel";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { getArtworks } from "../services/api";
import type { Artwork } from "../types/artwork";
import "../styles/ArtworkTable.css";

const ROWS_PER_PAGE = 12;

const ArtworkTable: React.FC = () => {
  const [records, setRecords] = useState<Artwork[]>([]);
  const [selectedRows, setSelectedRows] = useState<Artwork[]>([]);
  const [selectedAcrossPages, setSelectedAcrossPages] = useState<
    Record<number, Artwork[]>
  >({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [rowInput, setRowInput] = useState("");
  const overlayRef = useRef<OverlayPanel>(null);

  const fetchData = async (pageNum: number) => {
    const res = await getArtworks(pageNum);
    if (res && res.data) {
      setRecords(res.data);
      setTotal(res.pagination.total);
    }
  };

  useEffect(() => {
    fetchData(page);
  }, [page]);

  
  const updatePageSelection = (pageNum: number, newSelection: Artwork[]) => {
    setSelectedAcrossPages((prev) => ({
      ...prev,
      [pageNum]: newSelection,
    }));
  };

  
  const handleOverlaySubmit = async () => {
    const totalToSelect = parseInt(rowInput);
    if (!totalToSelect || totalToSelect <= 0) return;

    const totalPages = Math.ceil(totalToSelect / ROWS_PER_PAGE);
    const newSelections: Record<number, Artwork[]> = {};

    for (let i = 1; i <= totalPages; i++) {
      const res = await getArtworks(i);
      if (res && res.data) {
        const startIndex = (i - 1) * ROWS_PER_PAGE;
        const endIndex = Math.min(startIndex + ROWS_PER_PAGE, totalToSelect);
        const toSelectCount = endIndex - startIndex;
        newSelections[i] = res.data.slice(0, toSelectCount);
      }
    }

    setSelectedAcrossPages(newSelections);
    if (newSelections[page]) {
      setSelectedRows(newSelections[page]);
    }

    overlayRef.current?.hide();
  };
  useEffect(() => {
    const saved = selectedAcrossPages[page] || [];
    setSelectedRows(saved);
  }, [page, selectedAcrossPages]);

  const onSelectionChange = (e: { value: Artwork[] }) => {
    setSelectedRows(e.value);
    updatePageSelection(page, e.value);
  };

  const titleHeader = (
    <div className="title-header">
      <Button
        icon="pi pi-angle-down" className="p-button-rounded p-button-outlined" onClick={(e) => overlayRef.current?.toggle(e)}
        tooltip="Select Rows"
        tooltipOptions={{ position: "bottom" }}
      />
      <OverlayPanel ref={overlayRef} className="p-3">
        <div className="overlay-content">
          <label>Select rows:</label>
          <InputText
            value={rowInput}
            onChange={(e) => setRowInput(e.target.value)}
            placeholder="Type number..."
          />
          <Button label="Submit" size="small" onClick={handleOverlaySubmit} />
        </div>
      </OverlayPanel>
      <span className="title-text">Title</span>
    </div>
  );

  const allSelectedRows = Object.values(selectedAcrossPages).flat();

  return (
    <div className="artwork-container">
      <h2 className="artwork-title">Artwork Table</h2>

      <DataTable
        value={records}
        paginator
        rows={ROWS_PER_PAGE}
        totalRecords={total}
        lazy
        dataKey="id"
        selectionMode="checkbox"
        selection={selectedRows}
        onSelectionChange={onSelectionChange}
        onPage={(e) => setPage(e.page + 1)}
      >
        <Column selectionMode="multiple" headerStyle={{ width: "3rem" }} />
        <Column field="title" header={titleHeader} />
        <Column field="place_of_origin" header="Origin" />
        <Column field="artist_display" header="Artist" />
        <Column field="date_start" header="Start Year" />
        <Column field="date_end" header="End Year" />
      </DataTable>

      <p className="selection-info">
        Total selected rows across pages: <strong>{allSelectedRows.length}</strong>
      </p>
    </div>
  );
};

export default ArtworkTable;

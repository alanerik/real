import React from "react";
import { Pagination } from "@heroui/react";

export default function App({ total, initialPage }) {
  const [currentPage, setCurrentPage] = React.useState(initialPage);

  const handleChange = (page) => {
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);
    window.location.href = url.toString();
  };

  return (
    <Pagination
      total={total}
      initialPage={initialPage}
      page={currentPage}
      onChange={handleChange}
      variant="faded"
      color="success"
    />
  );
}
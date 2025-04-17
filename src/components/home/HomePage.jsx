import * as React from "react";
import ColumnLayout from "@cloudscape-design/components/column-layout";


function HomePage()
{
    return (
        <ColumnLayout columns={1}>
        <div>Content 1</div>
        <div>Content 2</div>
        <div>Content 3</div>
        <div>Content 4</div>
      </ColumnLayout>
    )
}
export default HomePage;
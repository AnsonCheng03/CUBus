import React, { Component } from "react";
import { withTranslation } from "react-i18next";

interface routeMapProps {
  selectValue: any;
  setSelectValue: any;
  elementClass?: string;
  onChange?: any;
  setValueOnChange?: boolean;
  options: (string | undefined)[];
  translateValue?: boolean;
  t: any;
}

class routeSelectOption extends Component<routeMapProps> {
  render() {
    const {
      selectValue,
      setSelectValue,
      elementClass,
      onChange,
      setValueOnChange,
      options,
      translateValue,
      t,
    } = this.props;
    return (
      <select
        className={elementClass}
        value={selectValue}
        onChange={(e: any) => {
          if (setValueOnChange !== false) setSelectValue(e.target.value);
          if (onChange) onChange(e);
        }}
      >
        {options.map((value) =>
          value ? (
            <option key={value} value={value}>
              {translateValue ? t(value) : value}
            </option>
          ) : null
        )}
      </select>
    );
  }
}

export const RouteSelect = withTranslation("global")(routeSelectOption);

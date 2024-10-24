import {
  IonPicker,
  IonPickerColumn,
  IonPickerColumnOption,
} from "@ionic/react";
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
      <IonPicker>
        <IonPickerColumn
          value={selectValue}
          onIonChange={({ detail }: any) => {
            setSelectValue(detail.value);
          }}
        >
          {options &&
            options.map((value) =>
              value ? (
                <IonPickerColumnOption key={value} value={value}>
                  {translateValue ? t(value) : value}
                </IonPickerColumnOption>
              ) : null
            )}
        </IonPickerColumn>
      </IonPicker>
    );
  }
}

export const RouteSelect = withTranslation("global")(routeSelectOption);

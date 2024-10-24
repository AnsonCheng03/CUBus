import React, { Component, createRef } from "react";

function autocomplete(inp: HTMLInputElement, arr: string[], props: any): void {
  let currentFocus: number;

  inp.addEventListener("input", function (e: Event) {
    let a: HTMLDivElement | null, b: HTMLDivElement | null, i: number;
    const val: string = (this as HTMLInputElement).value;
    closeAllLists();
    if (!val) {
      return false;
    }
    currentFocus = -1;
    a = document.createElement("DIV") as HTMLDivElement;
    a.setAttribute("id", this.id + "autocomplete-list");
    a.setAttribute("class", "autocomplete-items");
    this.parentNode?.appendChild(a);

    for (i = 0; i < arr.length; i++) {
      if (arr[i].toUpperCase().includes(val.toUpperCase())) {
        b = document.createElement("DIV") as HTMLDivElement;
        b.innerHTML = arr[i].substr(0, val.length);
        b.innerHTML += arr[i].substr(val.length);
        b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";

        b.addEventListener("click", function (e: Event) {
          try {
            inp.value = (
              this.getElementsByTagName("input")[0] as HTMLInputElement
            ).value;
            props.setInputState(inp.value);
          } catch (e) {
            console.log(e);
          } finally {
            closeAllLists();
          }
        });
        a.appendChild(b);
      }
    }
  });

  inp.addEventListener("keydown", function (e: KeyboardEvent) {
    let x: HTMLCollectionOf<HTMLDivElement> | null = null;
    const list = document.getElementById(this.id + "autocomplete-list");
    if (list)
      x = list.getElementsByTagName("div") as HTMLCollectionOf<HTMLDivElement>;
    if (e.key === "ArrowDown") {
      currentFocus++;
      addActive(x);
    } else if (e.key === "ArrowUp") {
      currentFocus--;
      addActive(x);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (currentFocus > -1) {
        if (x) (x[currentFocus] as HTMLElement).click();
      }
    }
  });

  function addActive(x: HTMLCollectionOf<HTMLDivElement> | null) {
    if (!x) return false;
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = x.length - 1;
    x[currentFocus].classList.add("autocomplete-active");
  }

  function removeActive(x: HTMLCollectionOf<HTMLDivElement>) {
    for (let i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  function closeAllLists(elmnt?: HTMLElement) {
    const x = document.getElementsByClassName("autocomplete-items");
    for (let i = 0; i < x.length; i++) {
      if (elmnt !== x[i] && elmnt !== inp) {
        x[i].parentNode?.removeChild(x[i]);
      }
    }
  }

  document.addEventListener("click", function (e: Event) {
    closeAllLists(e.target as HTMLElement);
  });
}

interface AutoCompleteProps {
  allBuildings: string[];
  inputState?: any;
  setInputState?: any;
}

class AutoComplete extends Component<AutoCompleteProps> {
  inputRef = createRef<HTMLInputElement>();

  componentDidMount() {
    if (this.inputRef.current) {
      // const priorityStationsFiltered = allBuildings.filter((value) =>
      //   priorityStations.includes(value)
      // );
      // Initialize the autocomplete function when the component mounts
      autocomplete(this.inputRef.current, this.props.allBuildings, this.props);
    }
  }

  render() {
    return (
      <div className="autocomplete">
        <input
          className="text-box"
          type="text"
          ref={this.inputRef}
          id="Startbd"
          name="Startbd"
          autoComplete="off"
          value={this.props.inputState}
          onChange={(e) => {
            this.props.setInputState(e.target.value);
          }}
          onClick={(e) => e.currentTarget.select()}
        />
      </div>
    );
  }
}

export default AutoComplete;

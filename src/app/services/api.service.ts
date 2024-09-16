import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { throwError, Observable, catchError } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({})
};
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  bodyParam = {};
  constructor(private http: HttpClient) {}

  handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error}` + `Error message is: ${error.message}`
      );
    }
    // return an observable with a user-facing error message
    return throwError(error);
  }

  httpGet(url: string): Observable<any> {
    return this.http.get(url, httpOptions).pipe(
      catchError(this.handleError)
    );
  }

  // httpGetAll(url: string | null): Observable<League[]> {
  //   return this.http.get<any[]>(url, httpOptions).pipe(catchError(this.handleError));
  // }

  httpPost(url: string, bodyParam: any): Observable<any> {
    return this.http.post(url, bodyParam, httpOptions).pipe(
            catchError(this.handleError)
    );
  }

  httpPut(url: string, bodyParam: any): Observable<any> {
    return this.http.put(url, bodyParam, httpOptions).pipe(
      catchError(this.handleError)
    );
  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApifService {

  url= "https://fakestoreapi.com/products"

  constructor(private http: HttpClient) {}

  getNotes(): Observable<any>{
    return this.http.get(this.url)
  }
}
